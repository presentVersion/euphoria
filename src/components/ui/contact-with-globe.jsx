"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowRight, Mail, Phone, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as d3 from "d3";
import { feature } from "topojson-client";

const smoothEase = [0.25, 0.1, 0.25, 1];

const CONTACT_LINKS = [
  {
    icon: Mail,
    label: "triage@mediqueue.org",
    href: "mailto:triage@mediqueue.org",
  },
  { icon: Phone, label: "+91 (800) 321-TRAUMA", href: "tel:+918003214321" },
  {
    icon: Headphones,
    label: "support@mediqueue.org",
    href: "mailto:support@mediqueue.org",
  },
];

const cityCoordinates = {
  "san francisco": [37.7749, -122.4194],
  "new york": [40.7128, -74.006],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  paris: [48.8566, 2.3522],
  moscow: [55.7558, 37.6176],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  mumbai: [19.076, 72.8777],
  "los angeles": [34.0522, -118.2437],
  chicago: [41.8781, -87.6298],
};

function orthographicRaw(x, y) {
  const cosy = Math.cos(y);
  return [cosy * Math.sin(x), Math.sin(y)];
}

function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}

function interpolateProjection(raw0, raw1) {
  let t = 0;

  const createRawProjection = (alpha) => {
    return (lambda, phi) => {
      const [x0, y0] = raw0(lambda, phi);
      const [x1, y1] = raw1(lambda, phi);
      return [x0 + alpha * (x1 - x0), y0 + alpha * (y1 - y0)];
    };
  };

  const projection = d3.geoProjection(createRawProjection(t));

  const alphaMethod = (value) => {
    if (value !== undefined) {
      t = +value;
      const newProjection = d3.geoProjection(createRawProjection(t));

      if (projection.scale()) newProjection.scale(projection.scale());
      if (projection.translate()) newProjection.translate(projection.translate());
      if (projection.rotate()) newProjection.rotate(projection.rotate());
      if (projection.precision()) newProjection.precision(projection.precision());

      newProjection.alpha = alphaMethod;
      return newProjection;
    }
    return t;
  };

  projection.alpha = alphaMethod;
  return projection;
}

function GlobeWireframe({
  width,
  height,
  className = "aspect-square w-full max-w-[340px]",
  strokeColor = "currentColor",
  strokeWidth = 1.0,
  graticuleColor = "currentColor",
  graticuleOpacity = 0.2,
  sphereOutlineColor = "currentColor",
  sphereOutlineWidth = 1,
  autoRotate = true,
  autoRotateSpeed = 0.5,
  rotateToLocation,
  rotateCities = [],
  rotationSpeed = 3000,
  initialRotation = [0, 0],
  enableInteraction = true,
  showGraticule = true,
  startAsGlobe = true,
  countryFillColor,
  countryHoverColor,
  variant = "wireframe",
  scale = 1,
  backgroundColor,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(startAsGlobe ? 0 : 100);
  const [worldData, setWorldData] = useState([]);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState([0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const rotationInterval = useRef(null);
  const rotationAnimFrame = useRef(null);
  const rotationStartTime = useRef(null);
  const rotationFrom = useRef([0, 0]);
  const rotationTo = useRef([0, 0]);
  const animationFrame = useRef(null);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const resizeObserver = useRef(null);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const useResponsive = !width && !height;
  const finalWidth = useResponsive ? dimensions.width : width || 800;
  const finalHeight = useResponsive ? dimensions.height : height || 500;

  const defaultStrokeColor = strokeColor || "currentColor";
  const defaultGraticuleColor = graticuleColor || "currentColor";
  const defaultSphereOutlineColor = sphereOutlineColor || "currentColor";
  const defaultCountryFillColor = countryFillColor || (variant === "solid" ? "currentColor" : "none");
  const defaultBackgroundColor = backgroundColor || "transparent";

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const updateDimensions = () => {
      if (container && useResponsive) {
        const width = container.offsetWidth || 300;
        setDimensions({ width, height: width });
      }
    };

    updateDimensions();

    if (useResponsive) {
      resizeObserver.current = new ResizeObserver(updateDimensions);
      resizeObserver.current.observe(container);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(container);

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
      observer.unobserve(container);
    };
  }, [useResponsive]);

  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const world = await response.json();
        const countries = feature(world, world.objects.countries).features;
        setWorldData(countries);
      } catch (error) {
        console.error("Error loading world data:", error);
      }
    };
    loadWorldData();
  }, []);

  useEffect(() => {
    if (!autoRotate || !isVisible || isDragging || rotateCities.length > 0) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      return;
    }

    const rotate = () => {
      setRotation((prev) => [(prev[0] + autoRotateSpeed) % 360, prev[1]]);
      animationFrame.current = requestAnimationFrame(rotate);
    };

    animationFrame.current = requestAnimationFrame(rotate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [autoRotate, autoRotateSpeed, isVisible, isDragging, rotateCities.length]);

  const animateRotationTo = useCallback((target, duration = 1200) => {
    if (rotationAnimFrame.current) {
      cancelAnimationFrame(rotationAnimFrame.current);
    }

    rotationFrom.current = rotationRef.current;
    rotationTo.current = target;
    rotationStartTime.current = performance.now();

    const animate = (time) => {
      const elapsed = time - (rotationStartTime.current || 0);
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const lon = rotationFrom.current[0] + (rotationTo.current[0] - rotationFrom.current[0]) * eased;
      const lat = rotationFrom.current[1] + (rotationTo.current[1] - rotationFrom.current[1]) * eased;

      setRotation([lon, lat]);

      if (t < 1) {
        rotationAnimFrame.current = requestAnimationFrame(animate);
      }
    };

    rotationAnimFrame.current = requestAnimationFrame(animate);
  }, []);

  const handleMouseDown = (event) => {
    if (!enableInteraction) return;
    setIsDragging(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setLastMouse([event.clientX - rect.left, event.clientY - rect.top]);
    }
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !enableInteraction) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentMouse = [event.clientX - rect.left, event.clientY - rect.top];
    const dx = currentMouse[0] - lastMouse[0];
    const dy = currentMouse[1] - lastMouse[1];

    setRotation((prev) => [
      prev[0] + dx * 0.4,
      Math.max(-90, Math.min(90, prev[1] - dy * 0.4)),
    ]);

    setLastMouse(currentMouse);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  useEffect(() => {
    if (!svgRef.current || worldData.length === 0 || !isVisible) return;
    if (useResponsive && dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (defaultBackgroundColor !== "transparent") {
      const radius = (Math.min(finalWidth, finalHeight) / 2) * scale * 0.9;
      svg
        .append("circle")
        .attr("cx", finalWidth / 2)
        .attr("cy", finalHeight / 2)
        .attr("r", radius)
        .attr("fill", defaultBackgroundColor);
    }

    const projection = d3
      .geoOrthographic()
      .scale((Math.min(finalWidth, finalHeight) / 2) * scale * 0.9)
      .translate([finalWidth / 2, finalHeight / 2])
      .rotate([rotation[0], rotation[1]])
      .precision(0.1);

    const path = d3.geoPath().projection(projection);

    if (showGraticule && graticuleOpacity > 0) {
      try {
        const graticule = d3.geoGraticule();
        svg
          .append("path")
          .datum(graticule())
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", defaultGraticuleColor)
          .attr("stroke-width", 1)
          .attr("opacity", graticuleOpacity);
      } catch (e) {}
    }

    svg
      .selectAll(".country")
      .data(worldData)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", defaultCountryFillColor)
      .attr("stroke", defaultStrokeColor)
      .attr("stroke-width", strokeWidth)
      .attr("opacity", 0.85);

    try {
      svg
        .append("path")
        .datum({ type: "Sphere" })
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", defaultSphereOutlineColor)
        .attr("stroke-width", sphereOutlineWidth)
        .attr("opacity", 0.9);
    } catch (e) {}
  }, [
    worldData,
    rotation,
    isVisible,
    finalWidth,
    finalHeight,
    defaultStrokeColor,
    strokeWidth,
    defaultGraticuleColor,
    graticuleOpacity,
    defaultSphereOutlineColor,
    sphereOutlineWidth,
    showGraticule,
    defaultCountryFillColor,
    scale,
    defaultBackgroundColor,
    useResponsive,
    dimensions.width,
  ]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={finalWidth}
        height={finalHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={useResponsive ? "w-full h-full opacity-0 transition-opacity duration-1000" : ""}
        style={{
          cursor: enableInteraction ? (isDragging ? "grabbing" : "grab") : "default",
          opacity: useResponsive ? (dimensions.width > 0 ? 1 : 0) : 1,
        }}
      />
    </div>
  );
}

const FormDots = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    const isHorizontal = orientation === "horizontal";
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 flex items-center justify-center overflow-hidden",
          isHorizontal ? "w-full" : "h-full",
          className,
        )}
        {...props}
      >
        <div className={cn("relative", isHorizontal ? "w-full h-4" : "h-full w-4")}>
          <div
            className={cn("absolute inset-0 bg-repeat text-white/20")}
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 0.8px, transparent 0.8px)",
              backgroundSize: isHorizontal ? "6px 100%" : "100% 6px",
            }}
          />
        </div>
      </SeparatorPrimitive.Root>
    );
  },
);
FormDots.displayName = "FormDots";

export default function ContactWithGlobe({
  title = "Global Emergency Telehealth & Inquiries",
  subtitle = "Direct Clinical Connect",
  description = "AcuityFlow MediQueue connects hospital regional commands, disaster response teams, and patients across facilities worldwide.",
  className,
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className={cn("relative w-full bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden py-14 px-6 md:px-10", className)}>
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: smoothEase }}
            className="inline-flex items-center px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30"
          >
            <span className="text-xs text-indigo-400 font-semibold font-mono tracking-wider uppercase">
              {subtitle}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: smoothEase }}
            className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: smoothEase }}
            className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Contact Info + Globe */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white font-heading">
                Hospital Command Operations
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Direct hotline for inter-hospital transfers, critical code coordination, and trauma team dispatch.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {CONTACT_LINKS.map(({ icon: Icon, label, href }, i) => (
                <a
                  key={label}
                  href={href}
                  className="group flex items-center gap-3 w-fit text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 group-hover:border-indigo-400 group-hover:bg-indigo-950/40 flex items-center justify-center shrink-0 transition-all">
                    <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                  </div>
                  <span className="font-mono">{label}</span>
                </a>
              ))}
            </div>

            {/* 3D Rotating Wireframe Globe */}
            <div className="relative overflow-hidden h-56 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center">
              <GlobeWireframe
                className="w-full aspect-square max-w-[280px]"
                variant="wireframesolid"
                autoRotate
                autoRotateSpeed={0.5}
                strokeWidth={0.8}
                strokeColor="#818cf8"
                graticuleColor="#6366f1"
                graticuleOpacity={0.15}
                sphereOutlineColor="#4f46e5"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white mb-0.5">
                Send Operational Message
              </h3>
              <p className="text-xs text-slate-400">
                Direct route to the Emergency Chief and Triage Coordination Room.
              </p>
            </div>

            <FormDots />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. S. Nair"
                    className="clinical-input-line text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    Facility / Hospital
                  </label>
                  <input
                    type="text"
                    placeholder="Apollo Trauma Care"
                    className="clinical-input-line text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                  Email / Contact Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="contact@facility.org"
                  className="clinical-input-line text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                  Clinical Dispatch Details
                </label>
                <textarea
                  placeholder="Describe inquiry, transfer request, or system integration query..."
                  rows={3}
                  required
                  className="clinical-input-line text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-primary text-xs py-2.5 justify-center font-bold tracking-wider uppercase"
              >
                {submitted ? '✓ Dispatch Request Sent' : 'Transmit Message'}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

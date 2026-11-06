"use client";

import Image from "next/image";
import { useState } from "react";

interface RepositoryVisualProps {
  poster: string;
  animation?: string;
  alt: string;
  caption: string;
  className?: string;
  priority?: boolean;
}

export default function RepositoryVisual({
  poster, animation, alt, caption, className = "", priority = false,
}: RepositoryVisualProps) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className={`edi-repository-visual ${className}`}>
      <div className="edi-visual-canvas">
        <Image
          src={playing && animation ? animation : poster}
          alt={alt}
          fill
          sizes={priority ? "(max-width: 640px) 90vw, (max-width: 900px) 45vw, 540px" : "(max-width: 640px) 80vw, 220px"}
          priority={priority}
          unoptimized={playing}
          className="edi-repository-image"
        />
      </div>
      <figcaption>
        <span>{caption}</span>
        {animation && (
          <button
            type="button"
            aria-pressed={playing}
            aria-label={`${playing ? "Pause" : "Play"} ${caption.toLowerCase()} animation`}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? "Pause" : "Animate"}<span aria-hidden="true">{playing ? "Ⅱ" : "↗"}</span>
          </button>
        )}
      </figcaption>
    </figure>
  );
}

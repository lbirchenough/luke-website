"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ProjectCard({
  id,
  title,
  subtitle,
  description,
  thumbnail,
  thumbnailAlt,
  link,
  linkIsExternal = false,
  frontend,
  backend,
  database,
  hosting,
  additionalTechItems,
  isExpanded,
  onToggle,
}) {
  const LinkComponent = linkIsExternal ? "a" : Link;
  const linkProps = linkIsExternal
    ? {
        href: link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {
        href: link,
      };

  return (
    <div className="rounded-lg border border-gray-700 bg-slate-800 hover:border-blue-400 transition-colors">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Image
              src={thumbnail}
              alt={thumbnailAlt}
              width={200}
              height={120}
              className="rounded-lg border border-gray-700 object-cover"
            />
          </div>
          <div className="flex-1 flex items-start justify-between">
            <div className="flex-1">
              <LinkComponent
                {...linkProps}
                className="hover:text-blue-400 transition-colors"
              >
                <h2 className="text-2xl font-semibold text-white">{title}</h2>
              </LinkComponent>
              <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
            </div>
            <button
              onClick={() => onToggle(id)}
              className="ml-4 text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Toggle details"
            >
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-5">
            <p className="mb-5 text-gray-200">{description}</p>
            <h3 className="font-semibold text-blue-300">Tech stack</h3>
            <ul className="mt-2 list-disc list-inside text-gray-200 space-y-1">
              {frontend && (
                <li>
                  <span className="font-semibold text-white">Frontend:</span> {frontend}
                </li>
              )}
              {backend && (
                <li>
                  <span className="font-semibold text-white">Backend:</span> {backend}
                </li>
              )}
              {database && (
                <li>
                  <span className="font-semibold text-white">Database:</span> {database}
                </li>
              )}
              {hosting && (
                <li>
                  <span className="font-semibold text-white">Hosting:</span> {hosting}
                </li>
              )}
              {additionalTechItems}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


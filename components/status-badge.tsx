"use client";

import { ReactNode } from "react";

interface StatusBadgeProps {
  /** The text to display in the badge */
  text: string;
  /** The icon to display inside the colored circle */
  icon: ReactNode;
  /** The background color for the circle */
  circleColor: string;
  /** Additional CSS classes for the container */
  className?: string;
}

export function StatusBadge({
  text,
  icon,
  circleColor,
  className = "",
}: StatusBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 border px-2 py-1 rounded-md w-max ${className}`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${circleColor}`}
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900">{text}</span>
    </div>
  );
}

// Predefined status types for common use cases
interface StatusProps {
  /** Additional CSS classes for the container */
  className?: string;
}

export function ActiveStatusBadge({ className }: StatusProps) {
  return (
    <StatusBadge
      text="Actif"
      circleColor="bg-green-500"
      className={className}
      icon={
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      }
    />
  );
}

export function InactiveStatusBadge({ className }: StatusProps) {
  return (
    <StatusBadge
      text="Inactif"
      circleColor="bg-red-500"
      className={className}
      icon={
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      }
    />
  );
}

// Convenience component for employee status
export function EmployeeStatusBadge({
  isActive,
  className,
}: {
  isActive: boolean | null;
  className?: string;
}) {
  return isActive ? (
    <ActiveStatusBadge className={className} />
  ) : (
    <InactiveStatusBadge className={className} />
  );
}

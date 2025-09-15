"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string; // Format: "HH:mm" (e.g., "14:30")
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  className,
  disabled = false,
}: TimePickerProps) {
  // Parse the current value
  const [hours, minutes] = value ? value.split(":") : ["", ""];

  // Generate hours (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: hour, label: hour };
  });

  // Generate minutes (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, "0");
    return { value: minute, label: minute };
  });

  const handleHourChange = (newHour: string) => {
    const currentMinutes = minutes || "00";
    const newTime = `${newHour}:${currentMinutes}`;
    onChange?.(newTime);
  };

  const handleMinuteChange = (newMinute: string) => {
    const currentHours = hours || "00";
    const newTime = `${currentHours}:${newMinute}`;
    onChange?.(newTime);
  };

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      {/* Hours Selector */}
      <Select
        value={hours}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-gray-500 font-medium">:</span>

      {/* Minutes Selector */}
      <Select
        value={minutes}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Display current time */}
      {value && <span className="text-sm text-gray-600 ml-2">{value}</span>}
    </div>
  );
}

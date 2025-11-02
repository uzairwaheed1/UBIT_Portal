import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-col", className)} {...props} />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("relative flex flex-col p-6 pt-0 [&>div]:last:mb-0", className)} {...props} />
))
TimelineItem.displayName = "TimelineItem"

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center justify-between", className)} {...props} />
))
TimelineHeader.displayName = "TimelineHeader"

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
TimelineTitle.displayName = "TimelineTitle"

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-4 pt-4 text-sm", className)} {...props} />
))
TimelineContent.displayName = "TimelineContent"

const TimelineDot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-0 top-10 -translate-x-1/2 translate-y-1/2 rounded-full border bg-background p-1",
      className
    )}
    {...props}
  >
    <div className="h-2 w-2 rounded-full bg-foreground" />
  </div>
))
TimelineDot.displayName = "TimelineDot"

const TimelineLine = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-0 top-0 h-full w-px bg-muted-foreground/30",
      className
    )}
    {...props}
  />
))
TimelineLine.displayName = "TimelineLine"

export { Timeline, TimelineItem, TimelineHeader, TimelineTitle, TimelineContent, TimelineDot, TimelineLine }
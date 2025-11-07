"use client"

import { motion } from "framer-motion"
import React from "react"

/**
 * Fades in children from the bottom.
 */
export const FadeInUp = ({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay, duration, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

/**
 * Fades in children without any movement.
 */
export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay, duration, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

/**
 * A container that staggers the animation of its children.
 */
export const StaggerContainer = ({
  children,
  stagger = 0.1,
  delayChildren = 0,
  className,
}: {
  children: React.ReactNode
  stagger?: number
  delayChildren?: number
  className?: string
}) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
    transition={{ staggerChildren: stagger, delayChildren: delayChildren }}
    className={className}
  >
    {children}
  </motion.div>
)

/**
 * A child item for use within a StaggerContainer.
 */
export const StaggerItem = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    variants={{
      hidden: { y: 20, opacity: 0 },
      show: { y: 0, opacity: 1 },
    }}
    transition={{ ease: "easeInOut", duration: 0.5 }}
    className={className}
  >
    {children}
  </motion.div>
)
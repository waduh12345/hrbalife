import { motion } from 'framer-motion'
import clsx from 'clsx'

import { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'outline'
}

export default function Buttons({ children, variant = 'primary' }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={clsx(
        'rounded-full px-8 py-4 font-medium transition',
        variant === 'primary' &&
          'bg-accent text-white shadow-soft hover:opacity-90',
        variant === 'outline' &&
          'border border-primary text-primary hover:bg-primary hover:text-white'
      )}
    >
      {children}
    </motion.button>
  )
}

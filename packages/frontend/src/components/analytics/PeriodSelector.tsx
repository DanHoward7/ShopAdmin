'use client'

import { Box, Button, HStack } from '@chakra-ui/react'
import { FiCalendar } from 'react-icons/fi'
import type { AnalyticsPeriod } from '@/types/analytics'

interface PeriodSelectorProps {
  periods: Record<string, AnalyticsPeriod>
  selectedPeriod: AnalyticsPeriod
  onPeriodChange: (period: AnalyticsPeriod) => void
}

export function PeriodSelector({ periods, selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const periodOptions = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7Days', label: '7 Days' },
    { key: 'last30Days', label: '30 Days' },
    { key: 'last3Months', label: '3 Months' },
    { key: 'lastYear', label: '1 Year' },
  ]

  return (
    <HStack gap={2}>
      <Box mr={2}>
        <FiCalendar />
      </Box>
      {periodOptions.map((option) => {
        const period = periods[option.key as keyof typeof periods]
        const isSelected = period.label === selectedPeriod.label
        
        return (
          <Button
            key={option.key}
            size="sm"
            variant={isSelected ? 'solid' : 'outline'}
            colorScheme={isSelected ? 'blue' : 'gray'}
            onClick={() => onPeriodChange(period)}
          >
            {option.label}
          </Button>
        )
      })}
    </HStack>
  )
}

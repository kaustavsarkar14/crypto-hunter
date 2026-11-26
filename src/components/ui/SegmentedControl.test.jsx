// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

describe('SegmentedControl', () => {
  it('exposes radio semantics and reports changes', () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl
        label="Range"
        value="7"
        onChange={onChange}
        options={[
          { value: '7', label: '1W' },
          { value: '30', label: '1M' },
        ]}
      />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '1W' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: '1M' }))
    expect(onChange).toHaveBeenCalledWith('30')
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClassSelectionPage from '../ClassSelectionPage'
import { useGameStore } from '@/stores/gameStore'

describe('ClassSelectionPage', () => {
  beforeEach(() => {
    useGameStore.setState({
      timeMode: null,
      classType: 'KNIGHT',
    })
  })

  it('renders Archer as a selectable class', () => {
    render(
      <MemoryRouter>
        <ClassSelectionPage />
      </MemoryRouter>
    )

    expect(screen.getByText('弓使い')).toBeInTheDocument()
    expect(screen.getByText('ピアシングアロー')).toBeInTheDocument()
    expect(screen.getByText('アローレイン')).toBeInTheDocument()
    expect(screen.getAllByText('このクラスで開始')).toHaveLength(4)
  })
})

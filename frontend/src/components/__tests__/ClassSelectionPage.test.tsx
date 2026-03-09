import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClassSelectionPage from '../ClassSelectionPage'
import { useGameStore } from '@/stores/gameStore'
import { GameState, TimeMode } from '@/types'

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

  it('starts the game with Archer when the Archer card is selected', () => {
    useGameStore.setState({
      gameState: GameState.TITLE_SCREEN,
      timeMode: TimeMode.TEN_MINUTES,
      classType: 'KNIGHT',
      currentScore: 0,
    })

    render(
      <MemoryRouter>
        <ClassSelectionPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getAllByText('このクラスで開始')[3])

    const { classType, gameState, timeMode } = useGameStore.getState()
    expect(classType).toBe('ARCHER')
    expect(gameState).toBe('PLAYING')
    expect(timeMode).toBe(TimeMode.TEN_MINUTES)
  })
})

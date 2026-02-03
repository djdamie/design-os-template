'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, ChevronUp } from 'lucide-react'

export interface User {
  name: string
  email?: string
  role?: string
  avatarUrl?: string
}

export interface UserMenuProps {
  user: User
  onLogout?: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div ref={menuRef} className="relative">
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-xs font-semibold font-['DM_Sans']">
            {initials}
          </div>
        )}

        {/* Name and role */}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
            {user.name}
          </p>
          {user.role && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
              {user.role}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronUp
          className={`h-4 w-4 text-zinc-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {user.email && (
            <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                {user.email}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setIsOpen(false)
              onLogout?.()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-['DM_Sans']">Log out</span>
          </button>
        </div>
      )}
    </div>
  )
}

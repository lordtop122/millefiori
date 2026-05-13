'use client'

import { useSkinStore, Skin } from '@/lib/store/skinStore'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ShopPage() {
  const {
    allSkins,
    mySkins,
    loading,
    loadSkins,
    buySkin,
    equipSkin,
    isSkinOwned,
    isSkinEquipped,
    equippedSkins,
  } = useSkinStore()

  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    loadSkins()
  }, [])

  const handleBuy = async (skin: Skin) => {
    setBuying(skin.id)
    await buySkin(skin)
    setBuying(null)
  }

  const handleEquip = async (skin: Skin) => {
    await equipSkin(skin.id, skin.category)
  }

  const categoryInfo: Record<string, { emoji: string; label: string; color: string }> = {
    tiles: { emoji: '🀄', label: 'Тайлы', color: 'from-amber-400 to-orange-400' },
    board: { emoji: '🟩', label: 'Поле', color: 'from-emerald-400 to-green-400' },
    effects: { emoji: '✨', label: 'Эффекты', color: 'from-purple-400 to-pink-400' },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-2xl animate-pulse">⏳ Загрузка...</div>
      </div>
    )
  }

  const categories = ['tiles', 'board', 'effects'] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 p-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛍️</div>
          <h1 className="text-4xl font-bold text-gray-800">Магазин скинов</h1>
          <p className="text-gray-500 mt-2">Купи и экипируй скины для игры!</p>
          <Link href="/" className="text-amber-600 text-sm mt-2 inline-block">← На главную</Link>
        </div>

        {/* Мои скины */}
        {mySkins.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow mb-6">
            <h2 className="font-bold mb-2">🎒 Мои скины ({mySkins.length})</h2>
            <div className="flex flex-wrap gap-2">
              {allSkins.filter(s => isSkinOwned(s.id)).map(s => (
                <span key={s.id} className={`text-sm px-3 py-1 rounded-full ${
                  isSkinEquipped(s.id) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {categoryInfo[s.category]?.emoji} {s.name}
                  {isSkinEquipped(s.id) && ' ✓'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Категории */}
        {categories.map(cat => {
          const catSkins = allSkins.filter(s => s.category === cat)
          if (catSkins.length === 0) return null
          const info = categoryInfo[cat]

          return (
            <div key={cat} className="mb-6">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className={`bg-gradient-to-r ${info.color} text-white px-3 py-1 rounded-xl text-sm`}>
                  {info.emoji} {info.label}
                </span>
              </h2>
              <div className="grid gap-3">
                {catSkins.map(skin => {
                  const owned = isSkinOwned(skin.id)
                  const equipped = isSkinEquipped(skin.id)
                  const isBuying = buying === skin.id

                  return (
                    <div
                      key={skin.id}
                      className={`bg-white rounded-2xl p-4 shadow flex items-center justify-between transition border-2 ${
                        equipped ? 'border-green-400 bg-green-50' : 
                        owned ? 'border-blue-200' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{info.emoji}</div>
                        <div>
                          <div className="font-bold text-gray-800">{skin.name}</div>
                          <div className="text-sm text-gray-500">{skin.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!owned ? (
                          <button
                            onClick={() => handleBuy(skin)}
                            disabled={isBuying}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition disabled:opacity-50 shadow"
                          >
                            {isBuying ? '...' : skin.price_cents === 0 ? '🎁 FREE' : `$${(skin.price_cents / 100).toFixed(2)}`}
                          </button>
                        ) : !equipped ? (
                          <button
                            onClick={() => handleEquip(skin)}
                            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition shadow"
                          >
                            Экипировать
                          </button>
                        ) : (
                          <span className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold shadow">
                            ✓ Экипирован
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="text-center mt-8 text-xs text-gray-400">
          Демо-режим: все скины бесплатны
        </div>
      </div>
    </div>
  )
}
// src/lib/store/skinStore.ts
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Skin {
  id: string
  name: string
  description: string
  price_cents: number
  category: 'tiles' | 'board' | 'effects'
  preview_colors: string
}

interface SkinStore {
  allSkins: Skin[]
  mySkins: string[]
  equippedSkins: Record<string, string> // category -> skin_id
  loading: boolean
  loadSkins: () => Promise<void>
  buySkin: (skin: Skin) => Promise<void>
  equipSkin: (skinId: string, category: string) => Promise<void>
  getEquippedSkin: (category: string) => Skin | undefined
  isSkinOwned: (skinId: string) => boolean
  isSkinEquipped: (skinId: string) => boolean
}

export const useSkinStore = create<SkinStore>((set, get) => ({
  allSkins: [],
  mySkins: [],
  equippedSkins: {},
  loading: false,

  loadSkins: async () => {
    set({ loading: true })
    const supabase = createClient()

    const { data: allSkins } = await supabase
      .from('skins')
      .select('*')
      .order('price_cents')

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: userSkins } = await supabase
        .from('user_skins')
        .select('*')
        .eq('user_id', user.id)

      const owned = userSkins?.map(s => s.skin_id) || []
      const equipped: Record<string, string> = {}
      
      userSkins?.forEach(s => {
        if (s.is_equipped) {
          const skin = allSkins?.find(sk => sk.id === s.skin_id)
          if (skin) equipped[skin.category] = skin.id
        }
      })

      set({
        allSkins: allSkins || [],
        mySkins: owned,
        equippedSkins: equipped,
        loading: false,
      })
    } else {
      set({
        allSkins: allSkins || [],
        loading: false,
      })
    }
  },

  buySkin: async (skin: Skin) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Войдите в аккаунт чтобы покупать скины!')
      return
    }

    // Демо-режим: все скины бесплатно
    await supabase.from('user_skins').upsert({
      user_id: user.id,
      skin_id: skin.id,
    })
    
    set(state => ({
      mySkins: [...state.mySkins, skin.id],
    }))

    alert(`Скин "${skin.name}" получен! Можете экипировать его.`)
  },

  equipSkin: async (skinId: string, category: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Снимаем старый экипированный скин этой категории
    const { data: currentEquipped } = await supabase
      .from('user_skins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_equipped', true)

    if (currentEquipped) {
      await supabase
        .from('user_skins')
        .update({ is_equipped: false })
        .eq('user_id', user.id)
        .eq('is_equipped', true)
    }

    // Экипируем новый
    await supabase
      .from('user_skins')
      .update({ is_equipped: true })
      .eq('user_id', user.id)
      .eq('skin_id', skinId)

    set(state => ({
      equippedSkins: { ...state.equippedSkins, [category]: skinId },
    }))
  },

  getEquippedSkin: (category: string) => {
    const { allSkins, equippedSkins } = get()
    const skinId = equippedSkins[category]
    return allSkins.find(s => s.id === skinId)
  },

  isSkinOwned: (skinId: string) => {
    return get().mySkins.includes(skinId)
  },

  isSkinEquipped: (skinId: string) => {
    return Object.values(get().equippedSkins).includes(skinId)
  },
}))
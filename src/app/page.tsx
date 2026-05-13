import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold mb-4 text-amber-800 dark:text-amber-200">
          🀄 Millefiori
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Тысяча цветов маджонга
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-10 max-w-md mx-auto">
          Медитативный пасьянс с глубокой системой прогресса. 
          Решай головоломки, собирай узоры, прокачивай мастерство.
        </p>
        <div className="flex flex-col gap-3 justify-center items-center">
          <Link
            href="/play"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-lg transition w-48 text-center"
          >
            🎮 Играть
          </Link>
          <Link
            href="/daily"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg transition w-48 text-center"
          >
            📅 Ежедневное
          </Link>
          <Link
            href="/stats"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg transition w-48 text-center"
          >
            📊 Статистика
          </Link>
          <Link
            href="/leaderboard"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg text-lg transition w-48 text-center"
          >
            🏆 Лидеры
          </Link>
          <Link
            href="/shop"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg text-lg transition w-48 text-center"
          >
            🛍️ Магазин
          </Link>
          <Link
  href="/rewards"
  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg text-lg transition w-48 text-center"
>
  🎁 Награды
</Link>
        </div>
      </div>
    </div>
  )
}
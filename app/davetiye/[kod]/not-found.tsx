export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#1a1a1a' }}
    >
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <p className="text-gray-400 text-xl mb-2">Davetiye Bulunamadı</p>
        <p className="text-gray-500 text-sm">
          Bu davetiye kodu geçersiz veya süresi dolmuş olabilir.
        </p>
      </div>
    </main>
  )
}

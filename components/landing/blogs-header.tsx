export function BlogsHeader() {
  return (
    <section className="w-full bg-blue-50/50 py-12 px-4">
      <div className="container mx-auto max-w-5xl text-center">
        <div className="mb-4">
          <span className="text-gray-600">Blogs</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-blue-900">Insights, Tips</span> & <span className="text-purple-700">Inspiration</span>
          <br />
          for a Better Life
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Stay informed with expert advice, practical guides, and the latest trends to help you manage your daily life
          with ease. Whether it's productivity, finance, health, or lifestyle, we've got tips waiting for you to
          explore.
        </p>
      </div>
    </section>
  )
}

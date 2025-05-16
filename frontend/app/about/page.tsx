export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="max-w-3xl">
        <p className="mb-4">
          This is a base Next.js project with TypeScript and Tailwind CSS. It provides a starting point for your web
          application front-end.
        </p>
        <p className="mb-4">
          The project uses the App Router, which is the recommended way to structure Next.js applications. It provides
          features like:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Server Components</li>
          <li>Nested Layouts</li>
          <li>Loading UI</li>
          <li>Error Handling</li>
        </ul>
        <p>You can customize this project to fit your needs by adding components, pages, and functionality.</p>
      </div>
    </div>
  )
}

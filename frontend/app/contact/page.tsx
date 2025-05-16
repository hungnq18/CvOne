import { ContactForm } from "@/components/forms/contact-form"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="mb-4">
            Have questions or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as soon
            as possible.
          </p>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Our Information</h2>
            <div className="space-y-3">
              <p>
                <strong>Address:</strong> 123 Main Street, City, Country
              </p>
              <p>
                <strong>Email:</strong> info@example.com
              </p>
              <p>
                <strong>Phone:</strong> +1 (123) 456-7890
              </p>
            </div>
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}

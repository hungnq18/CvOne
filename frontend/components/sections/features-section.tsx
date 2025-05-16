import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid, Palette, Zap } from "lucide-react"

const features = [
  {
    icon: <LayoutGrid className="h-8 w-8" />,
    title: "Responsive Design",
    description: "Fully responsive layouts that work on any device, from mobile to desktop.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Performance Optimized",
    description: "Built with performance in mind for fast loading and smooth user experiences.",
  },
  {
    icon: <Palette className="h-8 w-8" />,
    title: "Modern UI",
    description: "Clean and modern UI components built with Tailwind CSS and shadcn/ui.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our front-end base comes with everything you need to build modern web applications.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="mb-4 text-primary">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

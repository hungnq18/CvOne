"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/providers/global_provider";
import { motion } from "framer-motion";
import { LayoutGrid, Palette, Zap } from "lucide-react";

const featuresTranslations = {
  en: [
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
  ],
  vi: [
    {
      icon: <LayoutGrid className="h-8 w-8" />,
      title: "Thiết kế đáp ứng",
      description: "Giao diện hoàn toàn đáp ứng, hoạt động trên mọi thiết bị từ điện thoại đến máy tính bàn.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Tối ưu hiệu năng",
      description: "Xây dựng với hiệu năng ưu tiên hàng đầu để tải nhanh và trải nghiệm mượt mà.",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Giao diện hiện đại",
      description: "Các thành phần UI sạch sẽ và hiện đại được xây dựng bằng Tailwind CSS và shadcn/ui.",
    },
  ]
}

export function FeaturesSection() {
  const { language } = useLanguage()
  const features = featuresTranslations[language] || featuresTranslations.en

  // Variants animation cho từng card
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {language === "vi" ? "Tính năng chính" : "Key Features"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === "vi"
              ? "Giao diện của chúng tôi đi kèm tất cả những gì bạn cần để xây dựng CV hiện đại."
              : "Our base comes with everything you need to build modern CVs."
            }
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="h-full"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 1.0 }}
            >
              <Card>
                <CardHeader>
                  <div className="mb-4 text-primary">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

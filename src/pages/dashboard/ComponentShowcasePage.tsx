import { Helmet } from "react-helmet-async"
import ComponentShowcase from "@/components/component-showcase/ComponentShowcase"

const ComponentShowcasePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Helmet>
        <title>Components | GeeLinsky</title>
        <meta name="description" content="Browse the component library and design system." />
      </Helmet>
      <ComponentShowcase />
    </div>
  )
}

export default ComponentShowcasePage

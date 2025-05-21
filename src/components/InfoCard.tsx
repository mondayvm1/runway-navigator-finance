
import { Card } from "@/components/ui/card";
import { Clock, Calculator, Save } from "lucide-react";

interface InfoCardProps {
  title: string;
  content: string;
  icon: string;
}

const InfoCard = ({ title, content, icon }: InfoCardProps) => {
  const renderIcon = () => {
    switch (icon) {
      case "Clock":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "Calculator":
        return <Calculator className="h-5 w-5 text-blue-500" />;
      case "Save":
        return <Save className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-5 bg-white shadow-md">
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">{renderIcon()}</div>
        <div>
          <h3 className="font-medium text-lg text-gray-800 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{content}</p>
        </div>
      </div>
    </Card>
  );
};

export default InfoCard;

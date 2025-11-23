'use client';

interface Props {
  title: string;
  content: React.ReactNode;
}

export default function HowToUse({ title, content }: Props) {
  return (
    <div className="card bg-gray-50 border-2 border-gray-200 mt-6">
      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
        <span className="text-2xl mr-2">💡</span>
        {title}
      </h3>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {content}
      </div>
    </div>
  );
}
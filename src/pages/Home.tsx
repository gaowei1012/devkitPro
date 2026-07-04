import { Link } from 'react-router-dom';
import { tools } from '@/config/tools';

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DevKit Pro</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          离线优先的开发者工具箱，所有数据处理均在浏览器本地完成。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className="group card flex flex-col gap-3 transition-all hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:group-hover:bg-primary-900">
              <tool.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

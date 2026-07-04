export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">隐私政策</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          最后更新：2026 年 7 月 4 日
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700 dark:prose-invert dark:text-gray-300">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. 概述</h2>
          <p className="mt-3 leading-relaxed">
            欢迎使用 DevKit Pro（以下简称「本网站」或「我们」）。我们重视您的隐私，并致力于以透明、负责的方式处理与您使用本网站相关的信息。本隐私政策说明我们收集、使用及保护信息的方式。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. 数据收集声明</h2>
          <p className="mt-3 leading-relaxed">
            DevKit Pro 是一款<strong>离线优先</strong>的开发者工具集。除 AI 相关功能外，本网站提供的所有工具（包括但不限于 JSON 格式化、Base64 编解码、图片处理、文件转换等）均在您本地浏览器的内存中完成数据处理。
          </p>
          <p className="mt-3 leading-relaxed">
            在此类功能中，您输入或上传的数据（包括 JSON、图片、文件及其他内容）<strong>仅在您的设备上处理，绝不上传至任何服务器</strong>，我们亦无法访问、存储或检索上述数据。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. AI 功能说明</h2>
          <p className="mt-3 leading-relaxed">
            本网站提供以下 AI 辅助功能，其行为与非 AI 工具不同：
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>AI 代码解释</strong>：您提交的源代码或文本将被发送至 OpenAI API，或您自行配置的兼容 API 端点，以生成解释结果。
            </li>
            <li>
              <strong>AI 正则生成</strong>：您输入的自然语言描述或示例文本将被发送至上述 API 端点，以生成正则表达式建议。
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            上述请求由您的浏览器直接发起，数据将传输至第三方 AI 服务提供商。我们<strong>强烈建议您不要在输入内容中包含敏感个人信息</strong>（如身份证号、银行卡号、密码、私钥、商业机密等）。您使用 AI 功能即表示您理解并接受该数据传输行为。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. API Key 存储</h2>
          <p className="mt-3 leading-relaxed">
            若您使用 AI 功能，您提供的 OpenAI API Key（或兼容服务的 API Key）及可选的自定义 API 端点地址，均<strong>仅保存在您浏览器的 localStorage 中</strong>，用于在本地发起 API 请求。
          </p>
          <p className="mt-3 leading-relaxed">
            我们不会收集、传输或存储您的 API Key；网站开发者及运营方无法获取您保存在 localStorage 中的密钥。您可随时通过浏览器设置清除本地存储以删除相关数据。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. Cookie 与本地存储</h2>
          <p className="mt-3 leading-relaxed">
            本网站<strong>不使用用于追踪或广告目的的 Cookie</strong>，亦不对接第三方分析或广告追踪服务。
          </p>
          <p className="mt-3 leading-relaxed">
            我们可能使用浏览器 localStorage 等必要的本地存储机制，以保存您的偏好设置（如深色/浅色主题）、AI 配置及工具使用状态。此类数据仅存在于您的设备上，不会上传至我们的服务器。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. 政策变更</h2>
          <p className="mt-3 leading-relaxed">
            我们可能不时更新本隐私政策。更新后的版本将在本页面发布，并注明「最后更新」日期。建议您定期查阅本页面以了解最新内容。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7. 联系我们</h2>
          <p className="mt-3 leading-relaxed">
            如对本隐私政策有任何疑问，请通过本网站提供的联系方式与我们取得联系。
          </p>
        </section>
      </div>
    </div>
  );
}

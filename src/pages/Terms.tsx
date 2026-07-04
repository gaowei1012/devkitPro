export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">使用条款</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          最后更新：2026 年 7 月 4 日
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700 dark:prose-invert dark:text-gray-300">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. 接受条款</h2>
          <p className="mt-3 leading-relaxed">
            访问或使用 DevKit Pro（以下简称「本网站」）即表示您已阅读、理解并同意受本使用条款的约束。若您不同意本条款的任何部分，请立即停止使用本网站。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. 服务说明</h2>
          <p className="mt-3 leading-relaxed">
            DevKit Pro 是一套面向开发者与技术人员提供的在线工具集合，涵盖数据格式化、编码转换、开发辅助及 AI 辅助等功能。本网站以「现状」（as is）方式提供，我们可能随时修改、暂停或终止部分或全部功能，而无需事先通知。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. 免责声明</h2>
          <p className="mt-3 leading-relaxed">
            本网站及其所有工具<strong>仅供学习、研究与开发辅助使用</strong>，不构成任何形式的法律、财务、安全或专业建议。
          </p>
          <p className="mt-3 leading-relaxed">
            在适用法律允许的最大范围内，我们不对以下事项承担任何法律责任：
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>工具输出结果的准确性、完整性或适用性；</li>
            <li>AI 功能生成的代码、正则表达式、解释文本或其他内容的正确性与安全性；</li>
            <li>因使用或无法使用本网站而产生的任何直接、间接、附带、特殊或后果性损害；</li>
            <li>因依赖本网站输出而部署至生产环境所导致的任何损失或数据损坏。</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            您应自行验证所有输出结果，并在将其用于关键业务或生产系统前进行充分测试与审查。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. 用户责任</h2>
          <p className="mt-3 leading-relaxed">
            您在使用本网站时，应遵守您所在国家或地区的所有适用法律法规，包括但不限于数据保护、知识产权、出口管制及网络安全相关法律。
          </p>
          <p className="mt-3 leading-relaxed">您不得利用本网站从事以下行为：</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>上传、处理或传播违法、侵权、恶意或有害内容；</li>
            <li>试图破坏、干扰或未经授权访问本网站或相关系统；</li>
            <li>将本网站用于任何可能损害他人合法权益或公共利益的用途。</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            因您违反本条款或适用法律而产生的全部责任，由您自行承担。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. 知识产权</h2>
          <p className="mt-3 leading-relaxed">
            本网站的界面设计、代码及标识等相关权利归 DevKit Pro 运营方所有。您通过本网站工具处理的数据及生成的输出，其权利归属由您与适用法律确定；我们不主张对您输入或输出内容的所有权。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. 第三方服务</h2>
          <p className="mt-3 leading-relaxed">
            AI 相关功能依赖第三方 API 服务（如 OpenAI）。您使用该等功能时，亦须遵守相应第三方服务提供商的条款与政策。我们不对第三方服务的可用性、准确性或数据处理行为负责。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7. 条款变更</h2>
          <p className="mt-3 leading-relaxed">
            我们保留随时修改本使用条款的权利。修改后的条款自本页面发布之日起生效。您继续使用本网站即视为接受修订后的条款。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">8. 适用法律</h2>
          <p className="mt-3 leading-relaxed">
            本条款的解释与执行应适用中华人民共和国法律（不含冲突法规则），法律另有规定的从其规定。因本条款引起的争议，双方应友好协商解决；协商不成的，提交有管辖权的人民法院诉讼解决。
          </p>
        </section>
      </div>
    </div>
  );
}

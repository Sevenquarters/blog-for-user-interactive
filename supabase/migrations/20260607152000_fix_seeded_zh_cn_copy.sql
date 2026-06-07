update public.site_setting_translations
set
  site_name = '交互式博客平台',
  site_description = '一个基于 Supabase 与 Next.js 构建的交互式博客平台。'
where site_settings_id = 1
  and locale = 'zh-CN';

update public.category_translations
set
  name = case category_id
    when '31111111-1111-1111-1111-111111111111'::uuid then '工程实践'
    when '31111111-1111-1111-1111-111111111112'::uuid then '产品设计'
    when '31111111-1111-1111-1111-111111111113'::uuid then '设计系统'
    else name
  end,
  description = case category_id
    when '31111111-1111-1111-1111-111111111111'::uuid then '平台架构、基础设施与实现记录。'
    when '31111111-1111-1111-1111-111111111112'::uuid then '编辑规划、产品思考与路线图更新。'
    when '31111111-1111-1111-1111-111111111113'::uuid then '主题令牌、界面规范与视觉系统决策。'
    else description
  end
where locale = 'zh-CN'
  and category_id in (
    '31111111-1111-1111-1111-111111111111'::uuid,
    '31111111-1111-1111-1111-111111111112'::uuid,
    '31111111-1111-1111-1111-111111111113'::uuid
  );

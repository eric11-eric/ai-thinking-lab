(function attachChoicePortraits(root) {
  const definitions = {
    work: {
      anchor: 'work-3',
      pivot: 'work-2',
      variants: {
        a: {
          name: '机会开拓者',
          hero: '把省下的时间投向新机会',
          summary: '你看到 AI 带来的速度，先想到让团队争取更多项目。',
          gain: '这可能带来新的项目和收入，也可能让团队接触更复杂的任务。',
          risk: '但新任务可能很快填满工时，新人也未必自动获得练习机会。',
          marx: '生产力提高不会自动改善每个人的处境。新增效率怎样变成项目、工时和培养机会，仍取决于团队的招聘与分工。',
        },
        b: {
          name: '能力投资者',
          hero: '把效率换成培养新人的时间',
          summary: '你愿意把眼前的速度换成新人以后独立处理难题的能力。',
          gain: '这可能让团队积累长期本领，让技术收益进入人的成长。',
          risk: '培训会占用当下可交付的时间，也需要真正的任务和带教者。',
          marx: '劳动者的能力也是生产力的一部分。培养要落实到真实任务、反馈和带教时间，才能成为人的发展。',
        },
        c: {
          name: '时间守护者',
          hero: '先把技术省出的时间还给生活',
          summary: '你希望技术进步先让人少加班，重新拿回自己的时间。',
          gain: '休息和生活可以直接得到改善，效率不必只变成更多任务。',
          risk: '如果没有另作安排，新人接受培训和独立练习的机会可能不足。',
          marx: '评价生产力进步，不能只看产出，还要看人是否获得发展和自主安排生活的条件。',
        },
      },
      pivots: {
        a: '你让新人亲手做部分基础任务，同时安排 AI 提示和同事复核。成长机会被保留了，前提是团队真给带教者留出时间。',
        b: '你保住了短期进度，让新人观察复杂案例。这里最需要留意的是：看懂与亲手解决问题之间仍有距离。',
        c: '你尝试轮换任务，再调整 AI 分工。这样能发现不同人的能力，但轮换须伴随反馈，否则只是频繁换活。',
      },
      tensions: {
        'b:b': '你想把效率投入培养，但当前分工仍让新人看得多、做得少；培训时间还需要变成真实任务。',
      },
      extras: [
        { questionId: 'work-1', variants: {
          a: '进入岗位之前，你会做一份注明 AI 参与边界的样例，尽快展示能力，同时承认它不等于项目经验。',
          b: '你愿意先进入实习或小项目，让经验来自真实任务；这条路需要时间，也需要有人提供机会。',
          c: '你先投递，用现有经历换一次了解岗位的机会，也接受可能被早期筛选挡住。',
        } },
        { questionId: 'work-4', variants: {
          a: '平台给出低匹配度时，你仍会补充项目材料争取岗位，没有把系统排序当成最终判断。',
          b: '你会改写简历，让经历更容易被识别；也需留意自己是否只剩下系统能读懂的关键词。',
          c: '你把一次低匹配结果当作需要比较的信息，继续寻找其他岗位，也可能放过原本合适的机会。',
        } },
      ],
    },
    study: {
      anchor: 'study-3',
      pivot: 'study-4',
      variants: {
        a: {
          name: '讲述检验者',
          hero: '试着讲清楚自己学到的东西',
          summary: '你会关掉答案，试着把学到的东西讲给别人听。',
          gain: '说不清的地方容易暴露，解释的过程也会逼你整理理由。',
          risk: '能解释熟悉的例子，不一定意味着换一道题仍然会用。',
          marx: '表达是一种检验，但认识还要进入新的实践；换一个条件能否运用，才看得出理解的边界。',
        },
        b: {
          name: '反例追问者',
          hero: '靠反例追问解释的边界',
          summary: '你不急着接受顺畅的解释，会主动寻找它解释不了的情况。',
          gain: '这能帮助你发现一个结论适用于什么条件。',
          risk: 'AI 给出的反例也可能不准确，新的材料同样需要核实。',
          marx: '认识要随着事实修正，反例本身也须核实；不能用一个未经验证的答案推翻另一个答案。',
        },
        c: {
          name: '迁移试验者',
          hero: '用一道新题检验自己会不会用',
          summary: '你更相信换一道题独立做，能检验自己会不会运用知识。',
          gain: '这比只看懂原答案更容易发现知识能否迁移。',
          risk: '一次做不出，也不能证明之前什么都没学会。',
          marx: '实践检验认识需要具体条件和反复尝试，单次成败不能代替对理解过程的分析。',
        },
      },
      pivots: {
        a: '遇到相反材料，你愿意缩小并改写结论。这使论证更诚实，也考验截止前能否把理由说明白。',
        b: '你先核查新材料适用的条件。这能避免仓促推翻原结论，但核查完成前不宜把旧结论写成确定事实。',
        c: '你保留结论并公开疑问。这能让读者看见未解决之处；若新材料直接否定结论，还需要进一步修正。',
      },
      tensions: {
        'c:c': '你愿意用新题检验理解，却在相反材料出现时保留原结论；检验的结果也应有机会改变判断。',
      },
      extras: [
        { questionId: 'study-1', variants: {
          a: '开始写作时，你先读 AI 提纲再重排问题。工具帮你起步，问题意识还需要由你重新确定。',
          b: '你先拟自己的提纲，再请 AI 查漏。你保留了问题意识，但起步更慢。',
          c: '你用 AI 提出的几个问题打开思路，再自己找材料；问题还需要变成论证。',
        } },
        { questionId: 'study-2', variants: {
          a: '碰到找不到原文的引用，你选择继续找，保留这条证据的可能，也承担时间成本。',
          b: '你改用可核实的材料，并调整原来的说法；结论愿意跟着证据走。',
          c: '你删去暂时核实不了的引用，把结论收窄到已知范围。',
        } },
      ],
    },
    relationship: {
      anchor: 'relationship-4',
      pivot: 'relationship-3',
      variants: {
        a: {
          name: '现实重连者',
          hero: '主动把一部分时间还给朋友',
          summary: '你发现联系朋友变少，决定主动把一部分时间还给现实交往。',
          gain: '你有机会重新获得真人的回应和支持。',
          risk: '即时可得的安慰会减少，重新开始交流也可能有点难。',
          marx: '现实中的人生活在社会关系里；评价陪伴工具，要看它是否帮助人继续表达和共同面对生活。',
        },
        b: {
          name: '留意变化者',
          hero: '继续观察陪伴带来的变化',
          summary: '你珍惜 AI 目前带来的安慰，决定先观察这种用法会怎样影响自己。',
          gain: '眼下有效的支持得以保留，你也给自己留下判断时间。',
          risk: '如果没有明确观察期限，现实中的联系可能继续变少。',
          marx: '同一种工具对处境不同的人作用不同，判断应回到具体生活；观察的重点是人与人的联系有没有变化。',
        },
        c: {
          name: '边界划定者',
          hero: '给 AI 与现实关系划出分工',
          summary: '你让 AI 帮你整理想法，把需要共同解决的事留给现实中的人。',
          gain: '你可以利用工具，同时保留人与人的协商。',
          risk: '划界需要持续用心，也可能把难谈的事一再推迟。',
          marx: '人的发展离不开现实交往与自主选择；工具是否有益，要看它是否增强了这些能力。',
        },
      },
      pivots: {
        a: '你让 AI 帮忙想另一种解释，说明你想走出单一视角；但朋友的真实想法仍要向朋友确认。',
        b: '你选择直接听朋友说。真实对话可能不舒服，却能获得 AI 无法替你取得的另一方经验。',
        c: '你先记录感受，等平静后再谈。这能避免仓促回应；也要为重启对话留一个具体时机。',
      },
      tensions: {
        'a:c': '你想重新联系朋友，但面对分歧仍先暂停；给对话一个具体时机，联系才不会停在计划里。',
      },
      extras: [
        { questionId: 'relationship-1', variants: {
          a: '情绪低落时，你先借 AI 整理感受，仍打算明天找朋友；工具成了表达的准备。',
          b: '你给朋友留话，今晚先休息；这保留了真实联系，也意味着当晚需要自己面对情绪。',
          c: '你先把心情写给 AI，暂不决定是否告诉别人；整理可能有帮助，也可能推迟求助。',
        } },
        { questionId: 'relationship-2', variants: {
          a: '朋友觉得安慰的话不像你，你选择说明用了 AI，并询问哪里生疏；你愿意让关系容纳一次坦白。',
          b: '你先用自己的话重说一遍，让关心回到两人之间；工具来源的问题可能还会留着。',
          c: '你约时间通话，让声音和即时回应补足文字；这需要双方都有时间。',
        } },
      ],
    },
  };

  function build(reports) {
    if (!Array.isArray(reports) || reports.length !== 3) return null;
    const portraits = [];
    for (const report of reports) {
      const definition = definitions[report.id];
      if (!definition || !Array.isArray(report.decisions)) return null;
      const anchor = report.decisions.find((decision) => decision.questionId === definition.anchor);
      const pivot = report.decisions.find((decision) => decision.questionId === definition.pivot);
      if (!anchor || !pivot) return null;
      const variant = definition.variants[anchor.option.id];
      const pivotText = definition.tensions[anchor.option.id + ':' + pivot.option.id] || definition.pivots[pivot.option.id];
      const extraText = definition.extras.map((item) => {
        const decision = report.decisions.find((entry) => entry.questionId === item.questionId);
        return decision && item.variants[decision.option.id];
      });
      if (!variant || !pivotText || extraText.some((item) => !item)) return null;
      portraits.push({ ...report, ...variant, pivotText, extraText: extraText.join(' '), anchorId: definition.anchor, pivotId: definition.pivot });
    }
    return portraits;
  }

  root.AIChoiceLabPortraits = { build };
})(globalThis);

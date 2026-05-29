"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowUp,
  BookOpenText,
  Brain,
  Dice5,
  Mic,
  MoonStar,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
  Volume2,
} from "lucide-react";

type MainTab = "chat" | "ghost" | "memory";
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
type Memory = {
  id: string;
  content: string;
  source: "manual" | "system";
};
type FortuneLevel = "好" | "中" | "稳";

const fortuneItems: Array<{ label: string; level: FortuneLevel; mood: "laugh" | "smile" | "calm" }> = [
  { label: "学习", level: "好", mood: "laugh" },
  { label: "事业", level: "稳", mood: "smile" },
  { label: "关系", level: "好", mood: "laugh" },
  { label: "能量", level: "中", mood: "calm" },
];

const starterMessages: Message[] = [
  {
    id: "assistant-hello",
    role: "assistant",
    content:
      "我在。今天可以聊一个具体卡点：职业选择、商业想法、学习节奏，或者一个你说不清但一直卡着的念头。",
  },
];

const starterMemories: Memory[] = [
  {
    id: "memory-1",
    source: "system",
    content: "你更愿意听直接、具体、带判断的建议，而不是模板化安慰。",
  },
  {
    id: "memory-2",
    source: "manual",
    content: "你正在把 AI 产品能力沉淀成个人网站和真实项目入口。",
  },
];

const signs = [
  {
    title: "先把桌面清出来",
    phrase: "乱不是因为事多，是因为入口太多。",
    analysis:
      "今天适合先收窄问题。不要同时推进三个方向，挑一个最能改变局面的动作，做出一个可以被别人看见的版本。",
  },
  {
    title: "问得再狠一点",
    phrase: "温柔不是绕开真相。",
    analysis:
      "你今天的关键不是获得更多信息，而是把模糊问题问到无法逃避。把真正的限制写下来，答案会比想象中更快露出来。",
  },
  {
    title: "拿作品说话",
    phrase: "表达会被质疑，系统不会。",
    analysis:
      "把能力放进一个能点击、能运行、能复盘的东西里。今天适合补入口、补证据、补交接，而不是继续解释自己会什么。",
  },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dicePips(value: number) {
  const pips: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return pips[value] ?? pips[1];
}

function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div className={`dice ${rolling ? "is-rolling" : ""}`} aria-label={`${value} 点`}>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className={dicePips(value).includes(index) ? "is-on" : ""} />
      ))}
    </div>
  );
}

function tabLabel(tab: MainTab) {
  if (tab === "chat") return "对话";
  if (tab === "ghost") return "鬼点子";
  return "心迹";
}

function localReply(input: string) {
  const clean = input.trim();
  if (/职业|工作|方向|选择/.test(clean)) {
    return "先别问“我适合什么方向”，先问“哪个方向能最快让我拿到真实反馈”。把选择拆成 7 天可验证的小实验，比继续想象未来靠谱。";
  }
  if (/商业|项目|创业|产品/.test(clean)) {
    return "这个问题先看付费动机。用户不是为你的能力买单，而是为一个被缩短的痛苦路径买单。你要找到那个三步内能让他感到“终于省事了”的动作。";
  }
  if (/学习|课程|计划/.test(clean)) {
    return "学习计划不要先排满，先设一个最小闭环：输入、练习、反馈、复盘。每天只要闭环真的发生，节奏就会比宏大计划更稳。";
  }
  return "我会先把这句话背后的真实问题找出来：你现在缺的不是更多建议，而是一个能让局面开始移动的最小动作。把它压到今天能做完。";
}

export default function CompanionApp() {
  const [activeTab, setActiveTab] = useState<MainTab>("chat");
  const [teacherFrame, setTeacherFrame] = useState(0);
  const [teacherStatus, setTeacherStatus] = useState("高老师正在听...");
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");
  const [memories, setMemories] = useState<Memory[]>(starterMemories);
  const [memoryInput, setMemoryInput] = useState("");
  const [dice, setDice] = useState([2, 3, 6]);
  const [rolling, setRolling] = useState(false);
  const [signIndex, setSignIndex] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);

  const sign = signs[signIndex];
  const maskedContact = "138XXXX0427";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTeacherFrame((frame) => (frame + 1) % 6);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(new Date()),
    [],
  );

  function animateTeacher() {
    setTeacherStatus("高老师正在说...");
    let index = 0;
    const frames = [1, 2, 1, 3, 2, 4, 1, 5, 0];
    const timer = window.setInterval(() => {
      setTeacherFrame(frames[index] ?? 0);
      index += 1;
      if (index >= frames.length) {
        window.clearInterval(timer);
        setTeacherStatus("高老师正在听...");
      }
    }, 130);
  }

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    setMessages((current) => [
      ...current,
      { id: createId("user"), role: "user", content: value },
      { id: createId("assistant"), role: "assistant", content: localReply(value) },
    ]);
    setInput("");
    animateTeacher();
  }

  function handleRoll() {
    if (rolling) return;
    setRolling(true);
    const timer = window.setInterval(() => {
      setDice(Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1));
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(timer);
      const nextDice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
      const total = nextDice.reduce((sum, value) => sum + value, 0);
      setDice(nextDice);
      setSignIndex(total % signs.length);
      setHasRolled(true);
      setRolling(false);
      animateTeacher();
    }, 980);
  }

  function handleAddMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = memoryInput.trim();
    if (!value) return;
    setMemories((current) => [{ id: createId("memory"), source: "manual", content: value }, ...current]);
    setMemoryInput("");
  }

  return (
    <main className="companion-shell">
      <aside className="teacher-rail" aria-label="高老师陪伴面板">
        <div className="teacher-status">
          <span>{teacherStatus}</span>
          <button type="button" onClick={animateTeacher} aria-label="播放高老师回应">
            <Volume2 size={18} />
          </button>
        </div>

        <button type="button" className="teacher-portrait" onClick={animateTeacher} aria-label="唤起高老师">
          <Image
            src={`/gift/gao-frame-${teacherFrame}.png`}
            alt="高老师形象"
            width={190}
            height={262}
            priority
            unoptimized
          />
        </button>

        <button type="button" className="voice-button" onClick={animateTeacher}>
          <Mic size={20} />
          <span>语音通话</span>
        </button>

        <section className="fortune-panel" aria-label="今日运势">
          <div className="account-row">
            <div>
              <strong>{maskedContact}</strong>
              <span>{today}</span>
            </div>
            <UserRound size={20} />
          </div>
          <h2>- 今日运势 -</h2>
          <div className="fortune-grid">
            {fortuneItems.map((item) => (
              <div key={item.label} className="fortune-item">
                <Image src={`/gift/mood-${item.mood}.svg`} alt="" width={48} height={48} unoptimized />
                <span>{item.label}</span>
                <strong>{item.level}</strong>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <nav aria-label="主功能">
            {(["chat", "ghost", "memory"] as MainTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "chat" && <Brain size={17} />}
                {tab === "ghost" && <Dice5 size={17} />}
                {tab === "memory" && <BookOpenText size={17} />}
                <span>{tabLabel(tab)}</span>
              </button>
            ))}
          </nav>
          <div className="runtime-pill">
            <Sparkles size={16} />
            <span>Local Demo</span>
          </div>
        </header>

        {activeTab === "chat" && (
          <section className="chat-view" aria-label="对话">
            <div className="message-list">
              {messages.map((message) => (
                <article key={message.id} className={`message ${message.role}`}>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>
            <form className="chat-input" onSubmit={handleSend}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="输入消息"
                aria-label="输入消息"
              />
              <button type="submit" disabled={!input.trim()} aria-label="发送">
                <ArrowUp size={22} />
              </button>
            </form>
          </section>
        )}

        {activeTab === "ghost" && (
          <section className="ghost-view" aria-label="鬼点子">
            <div className="sign-copy">
              <span>
                <MoonStar size={17} />
                今日签文
              </span>
              <h1>{hasRolled ? sign.title : "心中默念·投掷问天"}</h1>
              <p>「{hasRolled ? sign.phrase : "专注心中所想，让骰子指引方向"}」</p>
            </div>
            <div className="dice-row">
              {dice.map((value, index) => (
                <DiceFace key={`${index}-${value}`} value={value} rolling={rolling} />
              ))}
            </div>
            <article className="sign-result">
              {hasRolled ? sign.analysis : "今天还没有投骰。先在心里放一个具体问题，再让高老师给你一个方向。"}
            </article>
            <div className="ghost-actions">
              <button type="button" onClick={handleRoll} disabled={rolling}>
                {rolling ? <RefreshCw size={18} className="spin" /> : <Dice5 size={18} />}
                <span>{rolling ? "投骰中" : hasRolled ? "再投一次" : "开始投骰"}</span>
              </button>
              <button type="button" onClick={() => setActiveTab("chat")}>
                <ArrowUp size={18} />
                <span>拿这个聊聊</span>
              </button>
            </div>
          </section>
        )}

        {activeTab === "memory" && (
          <section className="memory-view" aria-label="心迹">
            <div className="memory-head">
              <span>长期记忆层</span>
              <h1>高老师目前记得这些关于你的事</h1>
            </div>
            <form className="memory-form" onSubmit={handleAddMemory}>
              <input
                value={memoryInput}
                onChange={(event) => setMemoryInput(event.target.value)}
                placeholder="写入一条心迹"
                aria-label="写入一条心迹"
              />
              <button type="submit" disabled={!memoryInput.trim()} aria-label="写入心迹">
                <Plus size={18} />
              </button>
            </form>
            <div className="memory-list">
              {memories.map((memory) => (
                <article key={memory.id} className="memory-item">
                  <div>
                    <span>{memory.source === "manual" ? "手动写入" : "系统沉淀"}</span>
                    <strong>长期记忆</strong>
                  </div>
                  <p>{memory.content}</p>
                  <button
                    type="button"
                    onClick={() => setMemories((current) => current.filter((item) => item.id !== memory.id))}
                  >
                    <Trash2 size={15} />
                    <span>删除</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

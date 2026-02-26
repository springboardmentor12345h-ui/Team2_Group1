import { useState, useRef, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const LaraChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi ${user?.name?.split(" ")[0]}! I'm Lara, your CampusEventHub assistant. How can I help you today?`,
      sender: "lara",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const predefinedQA = [
    {
      q: "What is CampusEventHub?",
      a: "CampusEventHub is a centralized platform where colleges host inter-college events like Sports, Hackathons, Cultural Fests, and Workshops. It's your one-stop shop for campus engagement!",
    },
    {
      q: "How to register for an event?",
      a: "Easy! Browse the 'Upcoming Events' section on your dashboard, click 'View Details' on any event you like, and hit the 'Register' button.",
    },
    {
      q: "Where can I see my registrations?",
      a: "You can track all your registered events and their statuses directly from your personalized student dashboard.",
    },
    {
      q: "How do I get event updates?",
      a: "We provide real-time updates! Any changes to event schedules or your registration status will be reflected instantly on your dashboard.",
    },
    {
      q: "Can I host an event?",
      a: "If you have a 'College Admin' role, you can create and manage event listings, handle registrations, and set schedules through the Admin Dashboard.",
    },
  ];

  const handleQuestionClick = (qa) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: qa.q, sender: "user" },
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: qa.a, sender: "lara" },
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-purple-100 transition-all duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <SparklesIcon />
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="font-bold">Lara</h3>
                <p className="text-[10px] text-purple-100 uppercase tracking-widest font-bold">
                  Virtual Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-purple-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-purple-100 p-3 rounded-2xl rounded-tl-none flex space-x-1">
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="p-3 border-t border-purple-100 bg-white">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 px-1 tracking-wider">
              Suggested Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {predefinedQA.map((qa, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(qa)}
                  className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 border border-purple-200 transition-colors text-left font-medium"
                >
                  {qa.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-white text-purple-600 border border-purple-100 rotate-90"
            : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
        }`}
      >
        {isOpen ? (
          <XMarkIcon className="w-7 h-7" />
        ) : (
          <div className="relative">
            <ChatBubbleLeftRightIcon className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default LaraChatbot;

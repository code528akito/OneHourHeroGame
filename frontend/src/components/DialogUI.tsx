import React from 'react';
import type { Dialog } from '../models/NPC';

interface DialogUIProps {
  npcName: string;
  dialog: Dialog;
  onOptionSelect: (option: { nextDialogId?: string; action?: () => void }) => void;
  onSkip: () => void;
  onClose: () => void;
}

export const DialogUI: React.FC<DialogUIProps> = ({
  npcName,
  dialog,
  onOptionSelect,
  onSkip,
  onClose,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
      if (dialog.skipable !== false) {
        onSkip();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="bg-gray-800 border-4 border-gray-600 rounded-t-lg w-full max-w-4xl p-6 mb-0 animate-slide-up">
        {/* NPCネーム表示 */}
        <div className="bg-gray-700 px-4 py-2 rounded-t-lg inline-block mb-4">
          <h3 className="text-xl font-bold text-yellow-400">{npcName}</h3>
        </div>

        {/* 会話テキスト */}
        <div className="bg-gray-900 p-4 rounded-lg mb-4 min-h-[120px]">
          <p className="text-white text-lg leading-relaxed whitespace-pre-line">
            {dialog.text}
          </p>
        </div>

        {/* オプションボタン */}
        {dialog.options && dialog.options.length > 0 ? (
          <div className="flex flex-col gap-2">
            {dialog.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onOptionSelect(option)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-left"
              >
                {option.text}
              </button>
            ))}
          </div>
        ) : (
          /* 閉じるボタン */
          <div className="flex justify-end gap-4">
            {dialog.skipable !== false && (
              <button
                onClick={onSkip}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                スキップ (ESC)
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        )}

        {/* 操作ヒント */}
        {dialog.skipable !== false && (
          <div className="mt-4 text-gray-400 text-sm text-center">
            ESC または X キーでスキップ
          </div>
        )}
      </div>
    </div>
  );
};

// 石碑調査UI
interface MonumentUIProps {
  title: string;
  text: string;
  onClose: () => void;
}

export const MonumentUI: React.FC<MonumentUIProps> = ({
  title,
  text,
  onClose,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="bg-stone-800 border-4 border-stone-600 rounded-lg w-full max-w-2xl p-8 animate-fade-in">
        {/* タイトル */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400 mb-2">
            {title}
          </h2>
          <div className="h-1 w-32 bg-amber-400 mx-auto"></div>
        </div>

        {/* 石碑テキスト */}
        <div className="bg-stone-900 p-6 rounded-lg mb-6 border-2 border-stone-700">
          <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line text-center italic">
            {text}
          </p>
        </div>

        {/* 閉じるボタン */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-stone-600 hover:bg-stone-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            閉じる (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

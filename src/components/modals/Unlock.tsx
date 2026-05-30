import { motion } from "motion/react";

interface Props {
  confirmUnlockTarget: {
    index: number;
    name: string;
    required: number;
  } | null;

  coins: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UnlockModal({
  confirmUnlockTarget,
  coins,
  onClose,
  onConfirm
}: Props) {

  if (!confirmUnlockTarget) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed inset-0 z-50
        bg-black/70
        backdrop-blur-md
        flex items-center justify-center
        p-4
      "
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="
          max-w-md w-full
          bg-[#121216]
          border border-white/10
          rounded-2xl
          p-6
        "
      >
        <h3 className="text-lg font-black text-cyan-400 border-b border-white/5 pb-2">
          調閱權限確認
        </h3>

        <p className="text-zinc-300 text-sm mt-4">
          確定要解鎖歷史時空節點：
          <strong className="text-white">
            「{confirmUnlockTarget.name}」
          </strong>
          嗎？
        </p>

        <div className="
          mt-4
          p-4
          rounded-xl
          bg-zinc-900/60
          border border-white/5
          space-y-3
          text-xs
        ">

          <div className="flex justify-between">
            <span>當前終端餘額</span>
            <span>{coins} 碎片</span>
          </div>

          <div className="flex justify-between text-red-400">
            <span>解鎖需要扣除</span>
            <span>-{confirmUnlockTarget.required}</span>
          </div>

          <div className="flex justify-between text-emerald-400 font-bold">
            <span>剩餘</span>
            <span>
              {coins - confirmUnlockTarget.required}
            </span>
          </div>

        </div>

        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="
              flex-1
              py-3
              border border-white/10
              rounded-xl
            "
          >
            取消
          </button>

          <button
            onClick={onConfirm}
            className="
              flex-1
              py-3
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              text-white
              font-bold
            "
          >
            確認解鎖
          </button>

        </div>

      </motion.div>
    </motion.div>
  );
}
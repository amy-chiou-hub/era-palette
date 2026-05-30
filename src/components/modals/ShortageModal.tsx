import { motion } from "motion/react";
import { Lock, Coins } from "lucide-react";

interface Props {
  shortageTarget: {
    name: string;
    required: number;
    missing: number;
  } | null;

  onClose: () => void;
}

export default function ShortageModal({
  shortageTarget,
  onClose
}: Props) {

  if (!shortageTarget) return null;

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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="
          max-w-md w-full
          bg-zinc-950
          border border-red-500/20
          rounded-2xl
          p-6
          text-center
        "
      >
        <div className="
          w-14 h-14
          rounded-full
          bg-red-500/10
          border border-red-500/30
          flex items-center justify-center
          mx-auto mb-4
        ">
          <Lock className="w-6 h-6 text-red-400" />
        </div>

        <h3 className="text-xl font-black text-red-400 mb-2">
          時光調閱權限不足
        </h3>

        <p className="text-zinc-400 text-sm mb-4">
          開啟「{shortageTarget.name}」
          需要 {shortageTarget.required} 個時光碎片
        </p>

        <div className="
          py-2 px-4
          rounded-xl
          bg-red-950/20
          border border-red-500/10
          text-red-300
          text-xs
          flex items-center justify-center gap-2
          mb-6
        ">
          <Coins className="w-4 h-4" />
          缺少 {shortageTarget.missing} 個碎片
        </div>

        <button
          onClick={onClose}
          className="
            w-full
            py-3
            border border-white/10
            rounded-xl
          "
        >
          確認
        </button>

      </motion.div>
    </motion.div>
  );
}
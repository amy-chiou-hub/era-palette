import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface Props {

  successTarget: {
    index: number;
    name: string;
    consumed: number;
  } | null;

  onEnter: (index: number) => void;
}

export default function SuccessModal({
  successTarget,
  onEnter
}: Props) {

  if (!successTarget) return null;

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
          border border-emerald-500/20
          rounded-2xl
          p-6
          text-center
        "
      >

        <div className="
          w-14 h-14
          rounded-full
          bg-emerald-500/10
          border border-emerald-500/30
          flex items-center justify-center
          mx-auto mb-4
        ">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>

        <h3 className="text-xl font-black text-emerald-400">
          時光節點接入成功
        </h3>

        <p className="text-zinc-400 text-sm mt-3 mb-6">
          「{successTarget.name}」
          通道已建立！

          <br />

          已消耗
          {successTarget.consumed}
          個碎片
        </p>

        <button
          onClick={() =>
            onEnter(successTarget.index)
          }
          className="
            w-full
            py-3
            rounded-xl
            bg-gradient-to-r
            from-emerald-500
            to-teal-600
            text-white
            font-bold
          "
        >
          立刻接入主機
        </button>

      </motion.div>
    </motion.div>
  );
}
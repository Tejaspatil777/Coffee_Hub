import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

function SettingsPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <Settings className="h-20 w-20 text-amber-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Settings</h2>
        <p className="text-gray-600">This page will be available soon</p>
      </motion.div>
    </div>
  );
}

export default SettingsPage;

import { GithubIcon, LinkedinIcon } from 'lucide-react'; // or any other icons you prefer

const teamMembers = [
  {
    name: "Farhana Akter Suci",
    university: "Jagannath University, Dhaka",
    description: "Final semester student of B.Sc.",
    social: {
      github: "#",
      linkedin: "#"
    }
  },
  {
    name: "Rifah Sajida Deya",
    university: "Jagannath University, Dhaka",
    description: "Final semester student of B.Sc.",
    social: {
      github: "#",
      linkedin: "#"
    }
  }
];

export default function Team() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The students behind this project
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-8">
              <div className="text-center">
                <div className="mx-auto h-32 w-32 rounded-full bg-gray-200 mb-4 overflow-hidden">
                  {/* Placeholder for profile image - replace with actual image if available */}
                  <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <span className="text-4xl">{member.name.charAt(0)}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-blue-600 mt-1">{member.university}</p>
                <p className="text-gray-600 mt-4">{member.description}</p>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon className="h-6 w-6" />
                </a>
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <p className="text-gray-500">
          Students of Computer Science and Engineering at Jagannath University, Dhaka
        </p>
      </motion.div>
    </div>
  );
}
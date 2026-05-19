import logo from "../imgs/mono_logo.png";

function Footer() {
  return (
    <footer className="bg-black dark:bg-black text-white py-10 border-t-2 border-red-600 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Monitoring System" className="h-16 w-16 object-contain" />
              <div className="animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">Infrastructure</span>
                  <span className="text-sm font-bold text-red-600 animate-bounce" style={{animationDelay: "0.1s"}}>Monitoring</span>
                  <span className="text-sm font-bold text-slate-400">System</span>
                </div>
                <div className="h-1 bg-gradient-to-r from-red-600 to-transparent rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Secure IT monitoring and supervision platform.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p>
                <span className="text-red-500 mr-2">✉️</span>
                <a href="mailto:contact@infrastructure-monitoring.local" className="hover:text-white transition">
                  contact@infrastructure-monitoring.local
                </a>
              </p>
              <p>
                <span className="text-red-500 mr-2">📞</span>
                <a href="tel:+212000000000" className="hover:text-white transition">
                  +212 000 000 000
                </a>
              </p>
            </div>
          </div>

          {/* Spacer for alignment */}
          <div></div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-center text-sm text-slate-400">
            © 2026 Infrastructure Monitoring System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

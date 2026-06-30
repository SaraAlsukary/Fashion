
const Footer = () => {
  return (
      <footer className="bg-moda-darkBg text-gray-400 py-16 border-t border-gray-800 mt-10">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm animate-fade-in-up">
              <div className="space-y-4">
                  <h3 className="text-white text-xl font-black tracking-wider">موضة<span className="text-moda-gold">.</span></h3>
                  <p className="text-xs leading-relaxed text-gray-400">وجهتك الأولى والأرقى للتسوق من أشهر المتاجر المحلية والعالمية، مصممة خصيصاً لتناسب تطلعاتك العصرية.</p>
              </div>
              <div>
                  <h4 className="text-white font-semibold mb-6">روابط سريعة</h4>
                  <ul className="space-y-3 text-xs">
                      <li><a href="#" className="hover:text-moda-purple hover:translate-x-[-5px] transition-all inline-block">عن المنصة</a></li>
                      <li><a href="#" className="hover:text-moda-purple hover:translate-x-[-5px] transition-all inline-block">انضم كتاجر</a></li>
                      <li><a href="#" className="hover:text-moda-purple hover:translate-x-[-5px] transition-all inline-block">مركز المساعدة</a></li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-white font-semibold mb-6">الشروط والخصوصية</h4>
                  <ul className="space-y-3 text-xs">
                      <li><a href="#" className="hover:text-moda-purple hover:translate-x-[-5px] transition-all inline-block">شروط الاستخدام</a></li>
                      <li><a href="#" className="hover:text-moda-purple hover:translate-x-[-5px] transition-all inline-block">سياسة الخصوصية</a></li>
                      <li><a href="#" className="hover:text-moda-purple hover:translate-x-[-5px] transition-all inline-block">سياسة الاسترجاع</a></li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-white font-semibold mb-6">تواصل معنا</h4>
                  <p className="text-xs text-gray-400 mb-3">اشترك في نشرتنا البريدية ليصلك كل جديد.</p>
                  <div className="flex gap-2 group">
                      <input type="email" placeholder="بريدك الإلكتروني" className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-xs w-full text-white focus:outline-none focus:border-moda-purple transition-colors" />
                      <button className="bg-moda-purple hover:bg-moda-purpleHover text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all hover:shadow-lg active:scale-95">اشترك</button>
                  </div>
              </div>
          </div>
      </footer>
  )
}

export default Footer
export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-6">
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client"
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, StarIcon, FolderIcon, TicketIcon, TruckIcon, RefreshCw, User as UserIcon, Users as UsersIcon, MessageSquare, Sparkles, BellIcon, MailIcon, Image as ImageIcon, ShoppingCart, Wallet, BarChart3, Target } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const StoreSidebar = ({storeInfo}) => {
    const [expandedSections, setExpandedSections] = useState({});
    const pathname = usePathname()
    
    const toggleSection = (sectionName) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }))
    }

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Categories', href: '/store/categories', icon: FolderIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Media', href: '/store/media', icon: ImageIcon },
        { name: 'Abandoned Checkout', href: '/store/abandoned-checkout', icon: ShoppingCart },
        { name: 'Coupons', href: '/store/coupons', icon: TicketIcon },
        { name: 'Shipping', href: '/store/shipping', icon: TruckIcon },
        { name: 'Customers', href: '/store/customers', icon: UsersIcon },
        { name: 'Manage Users', href: '/store/settings/users', icon: UserIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
        { name: 'Courier', href: '/store/courier', icon: TruckIcon },
        { name: 'Balance', href: '/store/balance', icon: Wallet },
        { name: 'Sales Report', href: '/store/sales-report', icon: BarChart3 },
        { name: 'Marketing Expenses', href: '/store/marketing-expenses', icon: Target },
        { name: 'Return Requests', href: '/store/return-requests', icon: RefreshCw },
        { name: 'Reviews', href: '/store/reviews', icon: StarIcon },
        { name: 'Support Tickets', href: '/store/tickets', icon: MessageSquare },
        { name: 'Contact Us Messages', href: '/store#contact-messages', icon: StarIcon },
        { name: 'Product Notifications', href: '/store/product-notifications', icon: BellIcon },
        { name: 'Promotional Emails', href: '/store/promotional-emails', icon: MailIcon },
        { name: 'Ad Tracking', href: '/store/ads-tracking', icon: BarChart3 },
    ]

    const sidebarSections = [
        {
            name: 'Storefront',
            icon: Sparkles,
            links: [
                { label: 'Category Sliders', href: '/store/storefront/category-sliders' },
                { label: 'Carousel Slider', href: '/store/storefront/carousel-slider' },
                { label: 'Deals of the Day', href: '/store/storefront/deals' },
                { label: 'Sitemap Categories', href: '/store/storefront/sitemap-categories' },
                { label: 'Home Menu Categories', href: '/store/storefront/home-menu-categories' },
                { label: 'Navbar Menu', href: '/store/storefront/navbar-menu' },
            ]
        }
    ]

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-72 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-r border-slate-200 flex flex-col overflow-hidden shadow-lg">
                
           
          
           
                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4">
                    {/* Main Links */}
                    <div className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`group flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/30 scale-[1.02]'
                                            : 'text-slate-700 hover:bg-white hover:shadow-md hover:scale-[1.01]'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-white/20' 
                                            : 'bg-slate-100 group-hover:bg-blue-50'
                                    }`}>
                                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'} />
                                    </div>
                                    <span className="flex-1">{link.name}</span>
                                    {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Storefront Section */}
                    {sidebarSections.map((section) => {
                        const Icon = section.icon
                        const isExpanded = expandedSections[section.name] ?? true

                        return (
                            <div key={section.name} className="mt-6">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.name)}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-white/20">
                                            <Icon size={20} />
                                        </div>
                                        <span className="font-semibold text-sm">{section.name}</span>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2.5} 
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>

                                {/* Links */}
                                {isExpanded && (
                                    <div className="mt-2 space-y-1 ml-2">
                                        {section.links.map((link) => {
                                            const isActive = pathname === link.href
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={`group flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-500'
                                                            : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-600 border-l-2 border-transparent'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                                        isActive ? 'bg-emerald-500' : 'bg-slate-300 group-hover:bg-emerald-400'
                                                    }`}></span>
                                                    {link.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Settings Button */}
                <div className="border-t border-slate-200 px-3 py-4 bg-slate-50/50">
                    <Link
                        href="/store/settings"
                        className="group flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-500 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default StoreSidebar

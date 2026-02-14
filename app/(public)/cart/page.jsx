
"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import Counter from "@/components/Counter";
import CartSummaryBox from "@/components/CartSummaryBox";
import ProductCard from "@/components/ProductCard";
import { deleteItemFromCart, fetchCart } from "@/lib/features/cart/cartSlice";
import { PackageIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { calculateShipping, fetchShippingSettings } from "@/lib/shipping";
import { useAuth } from "@/lib/useAuth";

export const dynamic = "force-dynamic";

export default function Cart() {
    const dispatch = useDispatch();
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
    const { user, getToken } = useAuth();
    const isSignedIn = !!user;

    const { cartItems } = useSelector((state) => state.cart);
    const products = useSelector((state) => state.product.list);

    const [productsLoaded, setProductsLoaded] = useState(false);
    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [shippingSetting, setShippingSetting] = useState(null);
    const [shippingFee, setShippingFee] = useState(0);


    // Ensure products list is loaded for cart display
    useEffect(() => {
        async function fetchProductsIfNeeded() {
            // Load more products if we don't have enough (cart items may not be in limited list)
            if (products.length < 100) {
                try {
                    const { data } = await axios.get("/api/products?limit=10000");
                    if (data.products && Array.isArray(data.products)) {
                        dispatch({ type: "product/setProduct", payload: data.products });
                        console.log('[Cart] Loaded', data.products.length, 'products from API');
                    }
                    setProductsLoaded(true);
                } catch (e) {
                    console.error('[Cart] Failed to load products:', e);
                    setProductsLoaded(true);
                }
            } else {
                setProductsLoaded(true);
            }
        }
        fetchProductsIfNeeded();
    }, [products.length, dispatch]);

    const createCartArray = () => {
        let total = 0;
        const arr = [];
        const invalidKeys = [];

        for (const [key, value] of Object.entries(cartItems || {})) {
            const product = products.find((p) => String(p._id) === String(key));
            const qty = typeof value === 'number' ? value : value?.quantity || 0;
            
            if (product && qty > 0) {
                const unitPrice = (typeof value === 'object' ? value?.price : undefined) ?? product.price ?? 0;
                arr.push({ ...product, quantity: qty, _cartPrice: unitPrice });
                const isOutOfStock = product.inStock === false || (typeof product.stockQuantity === 'number' && product.stockQuantity <= 0);
                if (!isOutOfStock) {
                    total += unitPrice * qty;
                }
            } else if (!product && qty > 0) {
                // Product not found - could be still loading or deleted
                // Don't delete it, just skip display for now
                console.warn('[Cart Page] Product not found in list:', key, 'qty:', qty);
                invalidKeys.push(key);
            }
        }

        // Only delete after products are confirmed loaded
        // (to avoid deleting valid items during initial load)
        if (productsLoaded && invalidKeys.length > 0) {
            invalidKeys.forEach((key) => dispatch(deleteItemFromCart({ productId: key })));
        }

        setCartArray(arr);
        setTotalPrice(total);
    };

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products, productsLoaded]);

    useEffect(() => {
        async function loadShipping() {
            const setting = await fetchShippingSettings();
            setShippingSetting(setting);
        }
        loadShipping();
    }, []);

    useEffect(() => {
        if (shippingSetting && cartArray.length > 0) {
            setShippingFee(calculateShipping({ cartItems: cartArray, shippingSetting }));
        } else {
            setShippingFee(0);
        }
    }, [shippingSetting, cartArray]);

    const fetchRecentOrders = async () => {
        if (!isSignedIn) {
            setLoadingOrders(false);
            return;
        }
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const recentProducts = [];
            const seen = new Set();
            if (data.orders && data.orders.length > 0) {
                for (const order of data.orders) {
                    for (const item of order.orderItems) {
                        if (!seen.has(item.product._id) && recentProducts.length < 8) {
                            seen.add(item.product._id);
                            recentProducts.push(item.product);
                        }
                    }
                    if (recentProducts.length >= 8) break;
                }
            }
            setRecentOrders(recentProducts);
        } catch (e) {
            console.error("Failed to fetch recent orders", e);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchRecentOrders();
    }, [isSignedIn]);

    // Keep cart in sync with DB for signed-in users (initial + on focus)
    useEffect(() => {
        if (!user) return;

        const syncFromServer = () => {
            dispatch(fetchCart({ getToken: async () => user.getIdToken() }));
        };

        syncFromServer();
        window.addEventListener('focus', syncFromServer);

        return () => {
            window.removeEventListener('focus', syncFromServer);
        };
    }, [user, dispatch]);

    if (!productsLoaded) {
        return <div className="text-center py-16 text-gray-400">Loading cart…</div>;
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }));
    };

    const getMaxQty = (item) => {
        if (item?.inStock === false) return 0;
        if (typeof item?.stockQuantity === 'number') return Math.max(0, item.stockQuantity);
        return null;
    };

    const inStockCartArray = cartArray.filter((item) => getMaxQty(item) !== 0);
    const outOfStockCartArray = cartArray.filter((item) => getMaxQty(item) === 0);
    const checkoutDisabled = inStockCartArray.length === 0;

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {cartArray.length > 0 ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cart ({cartArray.length})</h1>
                        </div>

                        <div className="flex gap-6 max-lg:flex-col">
                            <div className="flex-1 space-y-4">
                                {inStockCartArray.map((item, index) => (
                                    <div key={index} className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow" style={{ background: "inherit" }}>
                                        {(() => {
                                            const maxQty = getMaxQty(item);
                                            return (
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-1">{item.name}</h3>
                                                <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div>
                                                        <p className="text-lg font-bold text-orange-600">{currency} {(item._cartPrice ?? item.price ?? 0).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Counter productId={item._id} maxQty={maxQty} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 md:hidden">
                                                    <p className="text-sm font-semibold text-gray-900">Total: {currency}{((item._cartPrice ?? item.price ?? 0) * item.quantity).toLocaleString()}</p>
                                                    <button
                                                        onClick={() => handleDeleteItemFromCart(item._id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        REMOVE
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex flex-col items-end justify-between">
                                                <button
                                                    onClick={() => handleDeleteItemFromCart(item._id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2Icon size={20} />
                                                </button>
                                                <p className="text-lg font-bold text-gray-900">{currency}{((item._cartPrice ?? item.price ?? 0) * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                            );
                                        })()}
                                    </div>
                                ))}

                                {outOfStockCartArray.length > 0 && (
                                    <>
                                        <div className="pt-2 mt-2 border-t border-gray-200">
                                            <h2 className="text-lg md:text-xl font-bold text-red-600">Out of Stock Products</h2>
                                            <p className="text-xs text-gray-500 mt-1">These items are kept in cart but excluded from checkout.</p>
                                        </div>
                                        {outOfStockCartArray.map((item, index) => (
                                            <div key={`oos-${index}`} className="rounded-lg p-4 shadow-sm border border-red-100 bg-red-50/40">
                                                <div className="flex gap-4">
                                                    <div className="w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                                                        <Image
                                                            src={item.images[0]}
                                                            alt={item.name}
                                                            width={96}
                                                            height={96}
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-1">{item.name}</h3>
                                                        <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                                                        <p className="text-xs font-semibold text-red-600 mb-2">Out of Stock</p>

                                                        <div className="flex items-center justify-between mt-3">
                                                            <div>
                                                                <p className="text-lg font-bold text-orange-600">{currency} {(item._cartPrice ?? item.price ?? 0).toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Counter productId={item._id} maxQty={0} />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3 md:hidden">
                                                            <p className="text-sm font-semibold text-gray-900">Total: {currency}{((item._cartPrice ?? item.price ?? 0) * item.quantity).toLocaleString()}</p>
                                                            <button
                                                                onClick={() => handleDeleteItemFromCart(item._id)}
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                            >
                                                                REMOVE
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:flex flex-col items-end justify-between">
                                                        <button
                                                            onClick={() => handleDeleteItemFromCart(item._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2Icon size={20} />
                                                        </button>
                                                        <p className="text-lg font-bold text-gray-900">{currency}{((item._cartPrice ?? item.price ?? 0) * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="lg:w-[380px]">
                                <div className="lg:sticky lg:top-6 space-y-6">
                                    <CartSummaryBox
                                        subtotal={totalPrice}
                                        shipping={shippingFee}
                                        total={totalPrice + shippingFee}
                                        checkoutDisabled={checkoutDisabled}
                                        checkoutNote={outOfStockCartArray.length > 0 ? `${outOfStockCartArray.length} out-of-stock item(s) are excluded from checkout.` : ''}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col justify-center items-center py-20">
                        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md">
                            <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                                <PackageIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 mb-6">Add some products to get started</p>
                            <a href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                )}

                {isSignedIn && !loadingOrders && recentOrders.length > 0 && (
                    <div className="mt-16 mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <PackageIcon className="text-slate-700" size={28} />
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Recently Ordered</h2>
                        </div>
                        <p className="text-slate-500 mb-6">Products from your recent orders</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {recentOrders.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
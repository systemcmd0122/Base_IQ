"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { UserRoundPen, Mail, KeyRound, Menu, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/utils/supabase/client"

// レイアウト
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ユーザーの認証プロバイダーを取得
  useEffect(() => {
    const checkAuthProvider = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // identitiesからプロバイダーを取得
          const identities = session.user.identities || []
          const providerName = identities.length > 0 ? identities[0].provider : null
          setProvider(providerName)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("認証情報の取得に失敗しました:", error)
        setLoading(false)
      }
    }

    checkAuthProvider()
  }, [])

  // ナビゲーションアイテムを動的に生成
  const getNavigationItems = () => {
    // 基本のアイテム
    const items = [
      {
        name: "プロフィール",
        icon: UserRoundPen,
        href: "/settings/profile",
      }
    ]

    // Google認証以外のユーザーにはメールとパスワード変更を表示
    if (provider !== "google") {
      items.push(
        {
          name: "メールアドレス変更",
          icon: Mail,
          href: "/settings/email",
        },
        {
          name: "パスワード変更",
          icon: KeyRound,
          href: "/settings/password",
        }
      )
    }

    return items
  }

  const subNavigation = getNavigationItems()

  const NavButtons = () => (
    <>
      {subNavigation.map((item, index) => (
        <Button
          asChild
          key={index}
          variant="ghost"
          className={cn(
            "w-full justify-start font-bold text-left",
            pathname === item.href && "bg-primary/10 text-primary",
            "hover:bg-primary/10 transition-colors duration-200",
            item.name === "アカウント削除" && "text-red-500 hover:text-red-600"
          )}
          onClick={() => setIsOpen(false)}
        >
          <Link href={item.href}>
            <item.icon className="inline-block w-5 h-5 mr-2" />
            {item.name}
          </Link>
        </Button>
      ))}
    </>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 md:max-w-4xl flex justify-center items-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:max-w-4xl">
      {/* Mobile Navigation */}
      <div className="md:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[270px] bg-white" 
            style={{ backgroundColor: 'white' }}
          >
            <div className="flex flex-col space-y-2 pt-8">
              <NavButtons />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block space-y-2">
          <NavButtons />
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 bg-white shadow-sm rounded-lg p-6 border">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
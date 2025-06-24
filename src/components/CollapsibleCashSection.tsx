
import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/utils/formatters'

interface Account {
  name: string
  balance: number
}

interface CollapsibleCashSectionProps {
  accounts: Account[]
  onAddAccount: (name: string, balance: number) => void
  onUpdateAccount: (index: number, name: string, balance: number) => void
  onRemoveAccount: (index: number) => void
}

const CollapsibleCashSection = ({ 
  accounts, 
  onAddAccount, 
  onUpdateAccount, 
  onRemoveAccount 
}: CollapsibleCashSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountBalance, setNewAccountBalance] = useState('')

  const totalCash = accounts.reduce((sum, account) => sum + account.balance, 0)
  const displayAccounts = isExpanded ? accounts : accounts.slice(0, 2)

  const handleAddAccount = () => {
    if (newAccountName && newAccountBalance) {
      onAddAccount(newAccountName, parseFloat(newAccountBalance) || 0)
      setNewAccountName('')
      setNewAccountBalance('')
      setShowAddForm(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cash & Savings</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(totalCash)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAccounts.map((account, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <Input
              value={account.name}
              onChange={(e) => onUpdateAccount(index, e.target.value, account.balance)}
              className="flex-1 mr-2 bg-transparent border-0"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={account.balance}
                onChange={(e) => onUpdateAccount(index, account.name, parseFloat(e.target.value) || 0)}
                className="w-24 bg-transparent border-0 text-right"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveAccount(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
        
        {!isExpanded && accounts.length > 2 && (
          <div className="text-sm text-muted-foreground text-center">
            +{accounts.length - 2} more accounts
          </div>
        )}

        {showAddForm && (
          <div className="flex gap-2 p-2 bg-muted/30 rounded-md">
            <Input
              placeholder="Account name"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Balance"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              className="w-24"
            />
            <Button size="sm" onClick={handleAddAccount}>
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cash Account
        </Button>
      </CardContent>
    </Card>
  )
}

export default CollapsibleCashSection

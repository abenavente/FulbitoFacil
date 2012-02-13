class ChangeTypeColumn < ActiveRecord::Migration
  def up
	change_column(:owners, :birthday, :date)
  end

  def down
	change_column(:owners, :birthday, :string)
  end
end

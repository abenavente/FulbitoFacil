class DeleteColumnLocalSportsfields < ActiveRecord::Migration

  def change
	remove_column :sportsfields, :local
  end

end

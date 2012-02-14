class DeleteColumnDistrictCustomer < ActiveRecord::Migration
  def change
	remove_column :customers, :distrito_id
  end
  
end

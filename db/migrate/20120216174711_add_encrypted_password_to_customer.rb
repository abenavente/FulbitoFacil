class AddEncryptedPasswordToCustomer < ActiveRecord::Migration
  def change
    add_column :customers, :encrypted_password, :string

  end
end

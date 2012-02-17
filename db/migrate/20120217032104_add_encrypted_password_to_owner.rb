class AddEncryptedPasswordToOwner < ActiveRecord::Migration
  def change
    add_column :owners, :encrypted_password, :string

  end
end

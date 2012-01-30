require 'test_helper'

class IdentityCardTypesControllerTest < ActionController::TestCase
  setup do
    @identity_card_type = identity_card_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:identity_card_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create identity_card_type" do
    assert_difference('IdentityCardType.count') do
      post :create, identity_card_type: @identity_card_type.attributes
    end

    assert_redirected_to identity_card_type_path(assigns(:identity_card_type))
  end

  test "should show identity_card_type" do
    get :show, id: @identity_card_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @identity_card_type
    assert_response :success
  end

  test "should update identity_card_type" do
    put :update, id: @identity_card_type, identity_card_type: @identity_card_type.attributes
    assert_redirected_to identity_card_type_path(assigns(:identity_card_type))
  end

  test "should destroy identity_card_type" do
    assert_difference('IdentityCardType.count', -1) do
      delete :destroy, id: @identity_card_type
    end

    assert_redirected_to identity_card_types_path
  end
end

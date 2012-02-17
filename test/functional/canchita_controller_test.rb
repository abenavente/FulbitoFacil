require 'test_helper'

class CanchitaControllerTest < ActionController::TestCase
  setup do
    @canchitum = canchita(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:canchita)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create canchitum" do
    assert_difference('Canchitum.count') do
      post :create, canchitum: @canchitum.attributes
    end

    assert_redirected_to canchitum_path(assigns(:canchitum))
  end

  test "should show canchitum" do
    get :show, id: @canchitum
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @canchitum
    assert_response :success
  end

  test "should update canchitum" do
    put :update, id: @canchitum, canchitum: @canchitum.attributes
    assert_redirected_to canchitum_path(assigns(:canchitum))
  end

  test "should destroy canchitum" do
    assert_difference('Canchitum.count', -1) do
      delete :destroy, id: @canchitum
    end

    assert_redirected_to canchita_path
  end
end

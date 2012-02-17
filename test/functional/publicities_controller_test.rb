require 'test_helper'

class PublicitiesControllerTest < ActionController::TestCase
  setup do
    @publicity = publicities(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:publicities)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create publicity" do
    assert_difference('Publicity.count') do
      post :create, publicity: @publicity.attributes
    end

    assert_redirected_to publicity_path(assigns(:publicity))
  end

  test "should show publicity" do
    get :show, id: @publicity
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @publicity
    assert_response :success
  end

  test "should update publicity" do
    put :update, id: @publicity, publicity: @publicity.attributes
    assert_redirected_to publicity_path(assigns(:publicity))
  end

  test "should destroy publicity" do
    assert_difference('Publicity.count', -1) do
      delete :destroy, id: @publicity
    end

    assert_redirected_to publicities_path
  end
end

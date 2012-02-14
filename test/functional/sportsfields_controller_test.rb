require 'test_helper'

class SportsfieldsControllerTest < ActionController::TestCase
  setup do
    @sportsfield = sportsfields(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sportsfields)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sportsfield" do
    assert_difference('Sportsfield.count') do
      post :create, sportsfield: @sportsfield.attributes
    end

    assert_redirected_to sportsfield_path(assigns(:sportsfield))
  end

  test "should show sportsfield" do
    get :show, id: @sportsfield
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @sportsfield
    assert_response :success
  end

  test "should update sportsfield" do
    put :update, id: @sportsfield, sportsfield: @sportsfield.attributes
    assert_redirected_to sportsfield_path(assigns(:sportsfield))
  end

  test "should destroy sportsfield" do
    assert_difference('Sportsfield.count', -1) do
      delete :destroy, id: @sportsfield
    end

    assert_redirected_to sportsfields_path
  end
end
